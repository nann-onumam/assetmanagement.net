var builder = WebApplication.CreateBuilder(args);

// Configure Kestrel timeouts
builder.WebHost.UseKestrel(options => {
    options.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(30);
});

// Add services to the container.
builder.Services.AddControllers();

var app = builder.Build();

// Add logging for application lifetime
app.Lifetime.ApplicationStarted.Register(() => Console.WriteLine("Application started at " + DateTime.Now));
app.Lifetime.ApplicationStopping.Register(() => Console.WriteLine("Application stopping at " + DateTime.Now));
app.Lifetime.ApplicationStopped.Register(() => Console.WriteLine("Application stopped at " + DateTime.Now));

// Configure the HTTP request pipeline.
app.UseAuthorization();
app.MapControllers();

// app.MapGet("/test", () => "Hello World!");
app.MapGet("/api/categories", () => new[] {
    new { Id = 1, Name = "Electronics" },
    new { Id = 2, Name = "Furniture" },
    new { Id = 3, Name = "Vehicles" }
});
app.MapGet("/api/assets", () => new[] {
    new { Id = 1, Name = "Laptop", Model = "XPS 13", Value = 1200.00m, CategoryId = 1 },
    new { Id = 2, Name = "Chair", Model = "Ergonomic", Value = 150.00m, CategoryId = 2 }
});

app.Run();