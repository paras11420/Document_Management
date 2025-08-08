using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DepartmentController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/department
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Department>>> GetDepartments()
        {
            var departments = await _context.Departments.ToListAsync();
            if (departments == null || departments.Count == 0)
                return NotFound("No departments found.");
            
            return Ok(departments); // Return departments with a 200 status code
        }

        // POST: api/department
        [HttpPost]
        public async Task<ActionResult<Department>> AddDepartment(Department dept)
        {
            // Check if department already exists
            if (await _context.Departments.AnyAsync(d => d.Code == dept.Code))
                return BadRequest("Department with this code already exists.");

            _context.Departments.Add(dept);
            await _context.SaveChangesAsync();

            // Return Created status with location of new department
            return CreatedAtAction(nameof(GetDepartments), new { id = dept.Id }, dept);
        }

        // PUT: api/department/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDepartment(int id, Department dept)
        {
            if (id != dept.Id)
                return BadRequest("Department ID mismatch");

            _context.Entry(dept).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // Check if the department exists before updating
                if (!_context.Departments.Any(d => d.Id == id))
                    return NotFound("Department not found.");
                else
                    throw;
            }

            return NoContent(); // Return 204 No Content if update is successful
        }

        // DELETE: api/department/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDepartment(int id)
        {
            var dept = await _context.Departments.FindAsync(id);
            if (dept == null)
                return NotFound("Department not found.");

            _context.Departments.Remove(dept);
            await _context.SaveChangesAsync();

            return NoContent(); // Return 204 No Content after deletion
        }
    }
}
