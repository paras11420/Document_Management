using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Backend.Data;
using Backend.Models;
using System.IO;
using System.Threading.Tasks;
using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DocumentController(AppDbContext context)
        {
            _context = context;
        }

        // Upload document with department association
        [HttpPost("upload")]
        public async Task<IActionResult> UploadDocument([FromForm] IFormFile file, [FromForm] string title, [FromForm] int departmentId)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            // Check if the department exists
            var department = await _context.Departments.FindAsync(departmentId);
            if (department == null)
                return BadRequest("Department not found");

            // Save file to the server
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "UploadedDocs");

            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var filePath = Path.Combine(uploadsFolder, file.FileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Create the document and associate it with the department
            var document = new Document
            {
                Title = title,
                FileName = file.FileName,
                FilePath = filePath,
                UploadedAt = DateTime.UtcNow,
                DepartmentId = departmentId
            };

            // Add to database and save changes
            _context.Documents.Add(document);
            await _context.SaveChangesAsync();

            // Re-fetch the document with the department information included
            var savedDocument = await _context.Documents
                .Include(d => d.Department)
                .FirstOrDefaultAsync(d => d.Id == document.Id);

            // Return the document along with department name
            return Ok(new
            {
                message = "Document uploaded successfully",
                document = new
                {
                    savedDocument.Id,
                    savedDocument.Title,
                    savedDocument.FileName,
                    savedDocument.FilePath,
                    savedDocument.UploadedAt,
                    departmentName = savedDocument.Department?.Name ?? "N/A"  // If department is null, return "N/A"
                }
            });
        }
    }
}
