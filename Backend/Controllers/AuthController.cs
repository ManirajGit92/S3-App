using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Backend.Data;
using Backend.Models;
using System.Security.Cryptography;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public class AuthRequest
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string Username { get; set; } = string.Empty;
            public string Provider { get; set; } = string.Empty;
        }

        public class SocialAuthRequest
        {
            public string Provider { get; set; } = string.Empty;
            public string IdToken { get; set; } = string.Empty;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] AuthRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest("User already exists.");

            var user = new User
            {
                Email = request.Email,
                Username = string.IsNullOrEmpty(request.Username) ? request.Email : request.Username,
                PasswordHash = HashPassword(request.Password)
            };

            // Create default webpage entry for user
            var webpage = new Webpage
            {
                User = user
            };

            _context.Users.Add(user);
            _context.Webpages.Add(webpage);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User registered successfully" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AuthRequest request)
        {
            var user = await _context.Users.Include(u => u.Webpage).FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || user.PasswordHash != HashPassword(request.Password))
                return Unauthorized("Invalid credentials.");

            user.LastLoginDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user);
            return Ok(new { token, user.Username, user.Email, WebpageId = user.Webpage?.Id, UniqueId = user.WebpageUniqueId });
        }

        [HttpPost("social-login")]
        public async Task<IActionResult> SocialLogin([FromBody] AuthRequest request)
        {
            if (string.IsNullOrEmpty(request.Provider))
                return BadRequest("Provider is required");

            // In a real scenario, you would validate the OAuth token with the provider
            // For now, we'll generate a mock email based on the provider and timestamp
            string email = GenerateSocialEmail(request.Provider);
            string username = $"{request.Provider}_user";

            var user = await _context.Users.Include(u => u.Webpage).FirstOrDefaultAsync(u => u.Email == email);
            
            if (user == null)
            {
                // Create new user for social login
                user = new User
                {
                    Email = email,
                    Username = username,
                    PasswordHash = HashPassword(Guid.NewGuid().ToString()), // random password for OAuth users
                    AuthProvider = request.Provider
                };
                var webpage = new Webpage { User = user };
                _context.Users.Add(user);
                _context.Webpages.Add(webpage);
                await _context.SaveChangesAsync();
            }

            user.LastLoginDate = DateTime.UtcNow;
            user.AuthProvider = request.Provider;
            await _context.SaveChangesAsync();

            var token = GenerateJwtToken(user);
            return Ok(new { token, user.Username, user.Email, WebpageId = user.Webpage?.Id, UniqueId = user.WebpageUniqueId });
        }

        private string GenerateSocialEmail(string provider)
        {
            // Generate a consistent email for the social provider
            // In production, this would be obtained from the OAuth provider's token
            var timestamp = DateTime.UtcNow.Ticks;
            return $"{provider}_user_{timestamp}@oauth.local";
        }

        [Authorize]
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] AuthRequest request)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out int userId)) return Unauthorized();

            var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound();

            // Check if email is being changed and if it's already taken
            if (user.Email != request.Email && await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest("Email already in use.");

            user.Email = request.Email;
            if (!string.IsNullOrEmpty(request.Username)) user.Username = request.Username;
            if (!string.IsNullOrEmpty(request.Password)) user.PasswordHash = HashPassword(request.Password);
            
            user.UpdatedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Profile updated successfully", user.Username, user.Email });
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        private string GenerateJwtToken(User user)
        {
            var keyStr = _configuration["Jwt:Key"] ?? "ThisIsASecretKeyForJwtAuthenticationThatNeedsToBeLongEnough";
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyStr));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("WebpageId", user.Webpage?.Id.ToString() ?? ""),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
