using Microsoft.AspNetCore.Mvc;
using DocumentAuthAPI.Models;
using Backend.Data; // ⬅️ Make sure this matches your actual namespace for DbContext
using System.Linq;

namespace DocumentAuthAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("signup")] // Handles POST requests to /api/auth/signup
        public IActionResult Signup(User user)
        {
            var exists = _context.Users.FirstOrDefault(u => u.Username == user.Username);
            if (exists != null)
            {
                return BadRequest(new { message = "Username already 90exists" });
            }

            _context.Users.Add(user);
            _context.SaveChanges();

            return Ok(new { message = "User registered successfully" });
        }

        [HttpPost("login")] // Handles POST requests to /api/auth/login
        public IActionResult Login(LoginRequest login)
        {
            var user = _context.Users.FirstOrDefault(u =>
                u.Username == login.Username && u.Password == login.Password);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }

            return Ok(new
            {
                message = "Login successful",
                user = new
                {
                    user.Id,
                    user.Name,
                    user.Username,
                    user.Email,
                    user.Mobile,
                    user.Address,
                    user.GST,
                    user.PAN
                }
            });
        }
    }
}
