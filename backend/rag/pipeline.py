from typing import List, Dict, Any, Optional
from langchain_openai import OpenAIEmbeddings
from langchain_community.embeddings import OllamaEmbeddings
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Pinecone, Chroma
from langchain_community.document_loaders import (
    PyPDFLoader,
    TextLoader,
    UnstructuredWordDocumentLoader,
    UnstructuredMarkdownLoader
)
from pinecone import Pinecone as PineconeClient, ServerlessSpec
import os
import uuid
from datetime import datetime
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.logger import logger

class RAGPipeline:
    """
    Retrieval-Augmented Generation (RAG) Pipeline
    Handles document ingestion, embedding, storage, and retrieval
    """
    
    def __init__(self):
        # Use embeddings based on available providers
        groq_api_key = os.getenv("GROQ_API_KEY")
        openai_api_key = os.getenv("OPENAI_API_KEY")
        use_ollama = os.getenv("USE_OLLAMA", "true").lower() == "true"
        
        # Note: Groq doesn't provide embeddings, so we use a simple fallback
        # For production with Groq, you should use a separate embedding service
        if openai_api_key:
            logger.info("Using OpenAI embeddings")
            self.embeddings = OpenAIEmbeddings(
                openai_api_key=openai_api_key
            )
        elif use_ollama:
            ollama_base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
            ollama_model = os.getenv("OLLAMA_MODEL", "llama3.1")
            logger.info(f"Using Ollama embeddings with model: {ollama_model}")
            self.embeddings = OllamaEmbeddings(
                base_url=ollama_base_url,
                model=ollama_model
            )
        else:
            # For Groq-only setup, use HuggingFace sentence-transformers (free, runs locally)
            logger.info("Using HuggingFace embeddings (sentence-transformers)")
            self.embeddings = HuggingFaceEmbeddings(
                model_name="all-MiniLM-L6-v2",  # Fast, lightweight model
                model_kwargs={'device': 'cpu'},
                encode_kwargs={'normalize_embeddings': True}
            )
        
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,  # Smaller chunks for faster processing
            chunk_overlap=100,  # Reduced overlap
            length_function=len,
        )
        
        # Initialize vector store
        self.vector_store = self._initialize_vector_store()
        
        # Document metadata storage
        self.documents_db = {}
    
    def _initialize_vector_store(self):
        """Initialize vector database (Pinecone or Chroma)"""
        
        vector_db_type = os.getenv("VECTOR_DB", "chroma")
        
        if vector_db_type == "pinecone":
            pinecone_key = os.getenv("PINECONE_API_KEY")
            
            if pinecone_key:
                # Initialize Pinecone client (new v6+ API)
                pc = PineconeClient(api_key=pinecone_key)
                
                index_name = "universal-ai"
                existing_indexes = [idx.name for idx in pc.list_indexes()]
                
                if index_name not in existing_indexes:
                    pc.create_index(
                        name=index_name,
                        dimension=1536,  # OpenAI embedding dimension
                        metric="cosine",
                        spec=ServerlessSpec(cloud="aws", region="us-east-1")
                    )
                
                # Get the index
                index = pc.Index(index_name)
                
                return Pinecone(
                    index=index,
                    embedding=self.embeddings,
                    text_key="text"
                )
        
        # Default to Chroma (local vector DB)
        logger.info("Using Chroma as vector database")
        return Chroma(
            persist_directory="./chroma_db",
            embedding_function=self.embeddings
        )
    
    async def add_document(self, file_path: str, filename: str) -> str:
        """
        Add a document to the RAG system
        Returns document_id
        """
        try:
            logger.info(f"Processing document: {filename}")
            
            # Load document based on file type
            loader = self._get_loader(file_path)
            documents = loader.load()
            
            # Split into chunks
            chunks = self.text_splitter.split_documents(documents)
            
            # Generate document ID
            doc_id = str(uuid.uuid4())
            
            # Add metadata
            for chunk in chunks:
                chunk.metadata.update({
                    "document_id": doc_id,
                    "filename": filename,
                    "source": file_path,
                    "timestamp": datetime.utcnow().isoformat()
                })
            
            # Add to vector store
            self.vector_store.add_documents(chunks)
            
            # Store document metadata
            self.documents_db[doc_id] = {
                "id": doc_id,
                "filename": filename,
                "file_path": file_path,
                "chunks_count": len(chunks),
                "uploaded_at": datetime.utcnow().isoformat(),
                "status": "processed"
            }
            
            logger.info(f"Document processed: {filename} ({len(chunks)} chunks)")
            return doc_id
            
        except Exception as e:
            logger.error(f"Error processing document: {str(e)}")
            raise
    
    async def search(self, query: str, k: int = 5) -> List[Dict[str, Any]]:
        """
        Search for relevant documents
        Returns top k most relevant chunks
        """
        try:
            results = self.vector_store.similarity_search_with_score(query, k=k)
            
            formatted_results = []
            for doc, score in results:
                formatted_results.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "relevance_score": float(score)
                })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error searching documents: {str(e)}")
            return []
    
    async def search_by_document(self, document_id: str, query: str, k: int = 5) -> List[Dict[str, Any]]:
        """Search within a specific document"""
        
        try:
            # Filter by document_id
            results = self.vector_store.similarity_search_with_score(
                query,
                k=k,
                filter={"document_id": document_id}
            )
            
            formatted_results = []
            for doc, score in results:
                formatted_results.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "relevance_score": float(score)
                })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error searching in document: {str(e)}")
            return []
    
    async def list_documents(self) -> List[Dict[str, Any]]:
        """List all documents in the system"""
        return list(self.documents_db.values())
    
    async def delete_document(self, document_id: str):
        """Delete a document and its chunks from the system"""
        
        try:
            # Delete from vector store (implementation depends on vector DB)
            # This is a simplified version
            if document_id in self.documents_db:
                del self.documents_db[document_id]
                logger.info(f"Document {document_id} deleted")
            else:
                raise ValueError(f"Document {document_id} not found")
                
        except Exception as e:
            logger.error(f"Error deleting document: {str(e)}")
            raise
    
    def _get_loader(self, file_path: str):
        """Get appropriate document loader based on file extension"""
        
        ext = os.path.splitext(file_path)[1].lower()
        
        loaders = {
            ".pdf": PyPDFLoader,
            ".txt": TextLoader,
            ".md": UnstructuredMarkdownLoader,
            ".docx": UnstructuredWordDocumentLoader,
            ".doc": UnstructuredWordDocumentLoader,
        }
        
        loader_class = loaders.get(ext, TextLoader)
        return loader_class(file_path)
    
    async def get_document_summary(self, document_id: str) -> Optional[Dict[str, Any]]:
        """Get summary information about a document"""
        return self.documents_db.get(document_id)
    
    async def reindex_all(self):
        """Reindex all documents (useful for updates or migrations)"""
        
        logger.info("Starting reindexing of all documents...")
        
        for doc_id, doc_info in self.documents_db.items():
            try:
                file_path = doc_info["file_path"]
                if os.path.exists(file_path):
                    await self.add_document(file_path, doc_info["filename"])
                    logger.info(f"Reindexed: {doc_info['filename']}")
                else:
                    logger.warning(f"File not found: {file_path}")
            except Exception as e:
                logger.error(f"Error reindexing {doc_id}: {str(e)}")
        
        logger.info("Reindexing complete")
