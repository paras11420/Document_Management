using Backend.Data; // <-- Your DbContext namespace
using Backend.Services; // <-- Needed to register IDocumentService
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ✅ Add DbContext and connect to SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ✅ Register your custom services
builder.Services.AddScoped<IDocumentService, DocumentService>();

// ✅ Enable CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// ✅ Add Controllers
builder.Services.AddControllers();

// 🔨 Build the app
var app = builder.Build();

// ✅ Use Middleware
app.UseCors("AllowAll");

app.UseAuthorization();

app.MapControllers();

app.Run();
