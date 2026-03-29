using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using System.Security.Claims;

namespace Backend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AnalyticsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AnalyticsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var webpage = await _context.Webpages.FirstOrDefaultAsync(w => w.UserId == userId);
            if (webpage == null) return NotFound();

            var totalSales = await _context.SaleRecords.Where(s => s.WebpageId == webpage.Id).CountAsync();
            var totalRevenue = await _context.SaleRecords.Where(s => s.WebpageId == webpage.Id).SumAsync(s => s.TotalPrice);
            var totalVisits = await _context.AnalyticsEvents.Where(e => e.WebpageId == webpage.Id && e.EventType == "Visit").CountAsync();

            return Ok(new
            {
                TotalSales = totalSales,
                TotalRevenue = totalRevenue,
                TotalVisits = totalVisits
            });
        }

        [HttpGet("charts")]
        public async Task<IActionResult> GetChartData()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var webpage = await _context.Webpages.FirstOrDefaultAsync(w => w.UserId == userId);
            if (webpage == null) return NotFound();

            var last30Days = DateTime.UtcNow.AddDays(-30);

            // Daily Revenue & Visits
            var dailyStats = await _context.AnalyticsEvents
                .Where(e => e.WebpageId == webpage.Id && e.Timestamp >= last30Days)
                .GroupBy(e => e.Timestamp.Date)
                .Select(g => new
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    Visits = g.Count(e => e.EventType == "Visit"),
                    Sales = g.Count(e => e.EventType == "Sale")
                })
                .OrderBy(g => g.Date)
                .ToListAsync();

            // Revenue Trend (from SaleRecords)
            var revenueTrend = await _context.SaleRecords
                .Where(s => s.WebpageId == webpage.Id && s.Timestamp >= last30Days)
                .GroupBy(s => s.Timestamp.Date)
                .Select(g => new
                {
                    Date = g.Key.ToString("yyyy-MM-dd"),
                    Revenue = g.Sum(s => s.TotalPrice)
                })
                .OrderBy(g => g.Date)
                .ToListAsync();

            // Sales by Category
            var categoryStats = await _context.SaleRecords
                .Where(s => s.WebpageId == webpage.Id)
                .GroupBy(s => s.ProductCategory)
                .Select(g => new
                {
                    Category = string.IsNullOrEmpty(g.Key) ? "Other" : g.Key,
                    Count = g.Count()
                })
                .ToListAsync();

            // Top Products
            var topProducts = await _context.SaleRecords
                .Where(s => s.WebpageId == webpage.Id)
                .GroupBy(s => s.ProductName)
                .Select(g => new
                {
                    Name = g.Key,
                    Count = g.Count(),
                    Revenue = g.Sum(s => s.TotalPrice)
                })
                .OrderByDescending(g => g.Count)
                .Take(5)
                .ToListAsync();

            return Ok(new
            {
                DailyStats = dailyStats, // Date, Visits, Sales
                RevenueTrend = revenueTrend, // Date, Revenue
                CategoryStats = categoryStats, // Category, Count
                TopProducts = topProducts // Name, Count, Revenue
            });
        }
    }
}
