using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Webpage
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int UserId { get; set; }
        [ForeignKey("UserId")]
        public User? User { get; set; }

        public string HeaderInfo { get; set; } = string.Empty;
        public string MenuInfo { get; set; } = "[]"; // JSON array of menu items
        public string HomeSection { get; set; } = string.Empty;
        public string AboutUsSection { get; set; } = string.Empty;
        public string ServicesProductsSection { get; set; } = string.Empty;
        public string TeamsSection { get; set; } = string.Empty;
        public string ContactUsSection { get; set; } = string.Empty;
        public string FooterInfo { get; set; } = string.Empty;
        
        // JSON field for dynamic additional sections
        public string AdditionalSections { get; set; } = "[]";

        // Navigation
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
