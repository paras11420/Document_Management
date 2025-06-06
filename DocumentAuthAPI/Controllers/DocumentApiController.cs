using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Backend.Services;
using Backend.Models;
using System;
using System.Linq;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/document")]
    public class DocumentApiController : ControllerBase
    {
        private readonly IDocumentService _documentService;

        public DocumentApiController(IDocumentService documentService)
        {
            _documentService = documentService;
        }

        // Get all documents
        [HttpGet]
        public IActionResult GetAllDocuments()
        {
            try
            {
                var documents = _documentService.GetAllDocuments();

                // Check if documents are found
                if (documents == null || !documents.Any())
                    return NoContent();

                // Return documents with department details
                var documentList = documents.Select(doc => new
                {
                    doc.Id,
                    doc.Title,
                    doc.FileName,
                    doc.FilePath,
                    doc.UploadedAt,
                    // Ensure department name is included
                    DepartmentName = doc.Department != null ? doc.Department.Name : "N/A"
                }).ToList();

                return Ok(documentList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        // Get a specific document by ID
        [HttpGet("{id}")]
        public IActionResult GetDocumentById(int id)
        {
            try
            {
                var document = _documentService.GetDocumentById(id);

                // Check if document exists
                if (document == null)
                    return NotFound("Document not found");

                // Return document with department details
                var documentResponse = new
                {
                    document.Id,
                    document.Title,
                    document.FileName,
                    document.FilePath,
                    document.UploadedAt,
                    // Ensure department name is included
                    DepartmentName = document.Department != null ? document.Department.Name : "N/A"
                };

                return Ok(documentResponse);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        // Download a document by ID
        [HttpGet("download/{id}")]
        public IActionResult DownloadDocument(int id)
        {
            try
            {
                var document = _documentService.GetDocumentById(id);

                // Check if document exists
                if (document == null)
                    return NotFound("Document not found");

                var fileBytes = _documentService.DownloadDocumentFile(document);

                // Check if file exists on server
                if (fileBytes == null)
                    return NotFound("File not found on server");

                return File(fileBytes, "application/octet-stream", document.FileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        // Upload a document and associate with a department
        [HttpPost]
        public IActionResult UploadDocument([FromForm] string title, [FromForm] IFormFile file, [FromForm] int departmentId)
        {
            try
            {
                // Validate if file is provided
                if (file == null || file.Length == 0)
                {
                    return BadRequest("No file uploaded.");
                }

                var uploadedDocument = _documentService.UploadDocument(file, title, departmentId);

                // Check if document upload was successful
                if (uploadedDocument == null)
                {
                    return BadRequest("Failed to upload document.");
                }

                return Ok(new { message = "Document uploaded successfully", document = uploadedDocument });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        // Delete a document by ID
        [HttpDelete("{id}")]
        public IActionResult DeleteDocument(int id)
        {
            try
            {
                var deleted = _documentService.DeleteDocument(id);

                // Check if document exists
                if (!deleted)
                    return NotFound("Document not found");

                return Ok(new { message = "Document deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        // Get all departments for the dropdown
        [HttpGet("departments")]
        public IActionResult GetDepartments()
        {
            try
            {
                var departments = _documentService.GetDepartments();

                // Check if departments are found
                if (departments == null || !departments.Any())
                    return NoContent();

                return Ok(departments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
    }
}
