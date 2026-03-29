using Microsoft.EntityFrameworkCore;
using Backend.Models;

namespace Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Webpage> Webpages { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<FAQ> FAQs { get; set; }
        public DbSet<ChatMessage> ChatMessages { get; set; }
        public DbSet<SaleRecord> SaleRecords { get; set; }
        public DbSet<AnalyticsEvent> AnalyticsEvents { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Webpage has one User, User has one Webpage
            modelBuilder.Entity<User>()
                .HasOne(u => u.Webpage)
                .WithOne(w => w.User)
                .HasForeignKey<Webpage>(w => w.UserId);

            // Webpage has many Products
            modelBuilder.Entity<Webpage>()
                .HasMany(w => w.Products)
                .WithOne(p => p.Webpage)
                .HasForeignKey(p => p.WebpageId);

            // Webpage has many SaleRecords
            modelBuilder.Entity<Webpage>()
                .HasMany<SaleRecord>()
                .WithOne(s => s.Webpage)
                .HasForeignKey(s => s.WebpageId);
                
            // Webpage has many AnalyticsEvents
            modelBuilder.Entity<Webpage>()
                .HasMany<AnalyticsEvent>()
                .WithOne(e => e.Webpage)
                .HasForeignKey(e => e.WebpageId);
        }
    }
}
