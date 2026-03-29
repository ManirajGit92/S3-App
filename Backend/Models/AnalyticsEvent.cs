using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class AnalyticsEvent
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int WebpageId { get; set; }
        [ForeignKey("WebpageId")]
        public Webpage? Webpage { get; set; }

        [Required]
        public string EventType { get; set; } = string.Empty; // "Visit", "Sale", "Chat"

        public string Description { get; set; } = string.Empty;

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // Additional optional details (like product name for sale event)
        public string Details { get; set; } = "{}";
    }
}
