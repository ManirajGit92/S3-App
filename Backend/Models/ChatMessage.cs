using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class ChatMessage
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public string SessionId { get; set; } = string.Empty;

        [Required]
        public string Sender { get; set; } = string.Empty; // "User" or "Bot"

        [Required]
        public string Message { get; set; } = string.Empty;

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // Optional user details (collected if query is complex)
        public string? UserName { get; set; }
        public string? UserContact { get; set; }
    }
}
