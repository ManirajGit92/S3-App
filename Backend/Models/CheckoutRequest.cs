using System.Collections.Generic;

namespace Backend.Models
{
    public class CheckoutRequest
    {
        public List<int> ProductIds { get; set; } = new();
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? PaymentMethod { get; set; }
    }
}
