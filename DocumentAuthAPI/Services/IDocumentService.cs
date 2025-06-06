using Backend.Models;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Backend.Services
{
    public interface IDocumentService
    {
        List<Document> GetAllDocuments();
        Document? GetDocumentById(int id);
        byte[]? DownloadDocumentFile(Document doc);
        bool DeleteDocument(int id);
        Task<Document> UploadDocument(IFormFile file, string title, int departmentId);
        List<Department> GetDepartments();
    }
}
