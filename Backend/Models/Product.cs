using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Product
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public string ProductId { get; set; } = Guid.NewGuid().ToString(); // SKU or unique identifier

        public int WebpageId { get; set; }
        [ForeignKey("WebpageId")]
        public Webpage? Webpage { get; set; }

        [Required]
        public string ProductName { get; set; } = string.Empty;

        public string ProductCategory { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        public int AvailableQuantity { get; set; }
        public int SoldQuantity { get; set; }

        public string Description { get; set; } = string.Empty;
        
        [Column(TypeName = "decimal(3,2)")]
        public decimal Rating { get; set; } = 0;

        // JSON object holding multiple information
        public string OtherSpec { get; set; } = "{}";
    }
}
