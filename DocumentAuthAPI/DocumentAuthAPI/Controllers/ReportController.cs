using Backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/reports")]
    public class ReportController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportController(AppDbContext context)
        {
            _context = context;
        }

        // 1️⃣ Department Summary
        [HttpGet("department-summary")]
        public async Task<IActionResult> GetDepartmentSummary()
        {
            try
            {
                var summary = await _context.Documents
                    .Include(d => d.Department)
                    .GroupBy(d => d.Department.Name)
                    .Select(group => new
                    {
                        Department = group.Key,
                        DocumentCount = group.Count(),
                        LastUploaded = group.Max(d => d.UploadedAt)
                    })
                    .ToListAsync();

                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to get department summary", error = ex.Message });
            }
        }

        // 2️⃣ Filtered Document Details with Download URL
        [HttpGet("document-details")]
        public async Task<IActionResult> GetDocumentDetails(
            [FromQuery] int? departmentId,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
            [FromQuery] string? search)
        {
            try
            {
                var query = _context.Documents
                    .Include(d => d.Department)
                    .AsQueryable();

                if (departmentId.HasValue)
                    query = query.Where(d => d.DepartmentId == departmentId.Value);

                if (from.HasValue)
                    query = query.Where(d => d.UploadedAt >= from.Value);

                if (to.HasValue)
                    query = query.Where(d => d.UploadedAt <= to.Value);

                if (!string.IsNullOrWhiteSpace(search))
                    query = query.Where(d => d.Title.Contains(search));

                var result = await query
                    .OrderByDescending(d => d.UploadedAt)
                    .Select(d => new
                    {
                        d.Title,
                        d.FileName,
                        d.UploadedAt,
                        Department = d.Department.Name,
                        DownloadUrl = Url.Action("DownloadDocument", "Report", new { fileName = d.FileName }, Request.Scheme)
                    })
                    .ToListAsync();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to get document details", error = ex.Message });
            }
        }

        // 3️⃣ File Download Endpoint
        [HttpGet("download")]
        public IActionResult DownloadDocument([FromQuery] string fileName)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "UploadedDocs"); // adjust folder path as needed
            var filePath = Path.Combine(uploadsFolder, fileName);

            if (!System.IO.File.Exists(filePath))
                return NotFound(new { message = "File not found" });

            var mimeType = "application/octet-stream";
            return PhysicalFile(filePath, mimeType, fileName);
        }
    }
}
