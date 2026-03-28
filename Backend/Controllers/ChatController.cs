using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChatController(AppDbContext context)
        {
            _context = context;
        }

        public class ChatRequest
        {
            public string SessionId { get; set; } = string.Empty;
            public string Message { get; set; } = string.Empty;
            public string? UserName { get; set; }
            public string? UserContact { get; set; }
        }

        // GET api/chat/faqs
        [HttpGet("faqs")]
        public async Task<IActionResult> GetFAQs()
        {
            var faqs = await _context.FAQs.ToListAsync();
            
            // Seed default FAQs if none exist
            if (faqs.Count == 0)
            {
                faqs = new List<FAQ>
                {
                    new FAQ { Question = "What are your services?", Answer = "We offer web development, mobile apps, and UI/UX design." },
                    new FAQ { Question = "How can I contact support?", Answer = "You can email us at support@s3app.com or call +91 98765 43210." },
                    new FAQ { Question = "Where are you located?", Answer = "Our main office is in Chennai, Tamil Nadu, India." },
                    new FAQ { Question = "What is your pricing?", Answer = "Pricing varies by project. Contact us for a custom quote!" }
                };
                _context.FAQs.AddRange(faqs);
                await _context.SaveChangesAsync();
            }
            
            return Ok(faqs);
        }

        // POST api/chat/message
        [HttpPost("message")]
        public async Task<IActionResult> SendMessage([FromBody] ChatRequest request)
        {
            // 1. Store User Message
            var userMsg = new ChatMessage
            {
                SessionId = request.SessionId,
                Sender = "User",
                Message = request.Message,
                UserName = request.UserName,
                UserContact = request.UserContact
            };
            _context.ChatMessages.Add(userMsg);

            // 2. Simple FAQ matching (case-insensitive contains)
            var botResponse = "I'm sorry, I don't have a specific answer for that. Would you like to leave your details for an admin to contact you?";
            
            var match = await _context.FAQs
                .FirstOrDefaultAsync(f => request.Message.ToLower().Contains(f.Question.ToLower()) || f.Question.ToLower().Contains(request.Message.ToLower()));

            if (match != null)
            {
                botResponse = match.Answer;
            }

            // 3. Store Bot Response
            var botMsg = new ChatMessage
            {
                SessionId = request.SessionId,
                Sender = "Bot",
                Message = botResponse
            };
            _context.ChatMessages.Add(botMsg);

            await _context.SaveChangesAsync();

            return Ok(new { message = botResponse, isFAQ = match != null });
        }

        // Admin Endpoints
        [Authorize]
        [HttpGet("history")]
        public async Task<IActionResult> GetChatHistory()
        {
            var history = await _context.ChatMessages
                .OrderByDescending(m => m.Timestamp)
                .ToListAsync();
            return Ok(history);
        }

        [Authorize]
        [HttpPost("faqs")]
        public async Task<IActionResult> ManageFAQ([FromBody] FAQ faq)
        {
            if (faq.Id == 0) _context.FAQs.Add(faq);
            else _context.FAQs.Update(faq);
            
            await _context.SaveChangesAsync();
            return Ok(faq);
        }

        [Authorize]
        [HttpDelete("faqs/{id}")]
        public async Task<IActionResult> DeleteFAQ(int id)
        {
            var faq = await _context.FAQs.FindAsync(id);
            if (faq == null) return NotFound();
            _context.FAQs.Remove(faq);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
