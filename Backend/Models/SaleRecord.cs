using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class SaleRecord
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int WebpageId { get; set; }
        [ForeignKey("WebpageId")]
        public Webpage? Webpage { get; set; }

        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ProductCategory { get; set; } = string.Empty;

        public int Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // Customer Info (Optional details from checkout)
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? PaymentMethod { get; set; }
    }
}
