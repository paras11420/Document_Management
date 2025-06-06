using Backend.Data;
using Backend.Models;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Backend.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly AppDbContext _context;

        public DocumentService(AppDbContext context)
        {
            _context = context;
        }

        // ✅ FIXED: Eager load Department
        public List<Document> GetAllDocuments()
        {
            try
            {
                return _context.Documents
                               .Include(d => d.Department) // 👈 include department
                               .OrderByDescending(d => d.UploadedAt)
                               .ToList();
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Error fetching documents.", ex);
            }
        }

        // ✅ FIXED: Eager load Department for single doc
        public Document? GetDocumentById(int id)
        {
            try
            {
                return _context.Documents
                               .Include(d => d.Department) // 👈 include department
                               .FirstOrDefault(d => d.Id == id);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Error fetching document with ID {id}.", ex);
            }
        }

        public byte[]? DownloadDocumentFile(Document doc)
        {
            try
            {
                if (doc == null || string.IsNullOrWhiteSpace(doc.FilePath))
                    return null;    

                if (!File.Exists(doc.FilePath))
                    return null;

                return File.ReadAllBytes(doc.FilePath);
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException("Error downloading the document file.", ex);
            }
        }

        public bool DeleteDocument(int id)
        {
            try
            {
                var document = _context.Documents.FirstOrDefault(d => d.Id == id);
                if (document == null)
                    return false;

                if (File.Exists(document.FilePath))
                    File.Delete(document.FilePath);

                _context.Documents.Remove(document);
                _context.SaveChanges();
                return true;
            }
            catch (Exception ex)
            {
                throw new InvalidOperationException($"Error deleting document with ID {id}.", ex);
            }
        }

        public async Task<Document> UploadDocument(IFormFile file, string title, int departmentId)
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("Invalid file.");

            var department = _context.Departments.FirstOrDefault(d => d.Id == departmentId);
            if (department == null)
                throw new ArgumentException("Invalid department ID.");

            var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "UploadedDocuments");
            if (!Directory.Exists(uploadsDir))
                Directory.CreateDirectory(uploadsDir);

            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadsDir, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var doc = new Document
            {
                Title = title,
                FileName = file.FileName,
                FilePath = filePath,
                UploadedAt = DateTime.UtcNow,
                DepartmentId = department.Id,
                Department = department
            };

            _context.Documents.Add(doc);
            _context.SaveChanges();

            return doc;
        }

        public List<Department> GetDepartments()
        {
            return _context.Departments.ToList();
        }
    }
}
