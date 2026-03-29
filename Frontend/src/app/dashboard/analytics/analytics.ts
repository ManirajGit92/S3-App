import { Component, inject, OnInit, signal, effect, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../api';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
})
export class Analytics implements OnInit, AfterViewInit, OnDestroy {
  private api = inject(Api);

  summary = signal({ totalSales: 0, totalRevenue: 0, totalVisits: 0 });
  isLoading = signal(true);

  @ViewChild('revenueChart') revenueChartRef!: ElementRef;
  @ViewChild('visitsChart') visitsChartRef!: ElementRef;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef;
  @ViewChild('productsChart') productsChartRef!: ElementRef;

  private charts: Chart[] = [];

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    // We'll init charts after data is loaded and signals are set
  }

  ngOnDestroy() {
    this.charts.forEach(c => c.destroy());
  }

  loadData() {
    this.isLoading.set(true);
    
    // Summary
    this.api.getAnalyticsSummary().subscribe({
      next: (data: any) => this.summary.set(data),
      error: () => {}
    });

    // Charts
    this.api.getAnalyticsCharts().subscribe({
      next: (data: any) => {
        this.isLoading.set(false);
        // Short delay to ensure view is updated
        setTimeout(() => this.initCharts(data), 0);
      },
      error: () => this.isLoading.set(false)
    });
  }

  initCharts(data: any) {
    this.charts.forEach(c => c.destroy());
    this.charts = [];

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: '#94a3b8' } }
        },
        scales: {
            x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }
        }
    };

    // 1. Revenue Trend (Line)
    this.charts.push(new Chart(this.revenueChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: data.revenueTrend.map((d: any) => d.date),
        datasets: [{
          label: 'Revenue (₹)',
          data: data.revenueTrend.map((d: any) => d.revenue),
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: commonOptions
    }));

    // 2. Visits Traffic (Bar)
    this.charts.push(new Chart(this.visitsChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: data.dailyStats.map((d: any) => d.date),
        datasets: [{
          label: 'Visits',
          data: data.dailyStats.map((d: any) => d.visits),
          backgroundColor: '#34d399',
          borderRadius: 4
        }]
      },
      options: commonOptions
    }));

    // 3. Category Breakdown (Doughnut)
    this.charts.push(new Chart(this.categoryChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: data.categoryStats.map((d: any) => d.category),
        datasets: [{
          data: data.categoryStats.map((d: any) => d.count),
          backgroundColor: ['#6366f1', '#34d399', '#f59e0b', '#ef4444', '#a855f7'],
          borderWidth: 0
        }]
      },
      options: { ...commonOptions, scales: undefined } as any
    }));

    // 4. Top Products (Horizontal Bar)
    this.charts.push(new Chart(this.productsChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: data.topProducts.map((d: any) => d.name),
        datasets: [{
          label: 'Units Sold',
          indexAxis: 'y',
          data: data.topProducts.map((d: any) => d.count),
          backgroundColor: '#6366f1',
          borderRadius: 4
        }]
      },
      options: { ...commonOptions, indexAxis: 'y' } as any
    }));
  }
}
