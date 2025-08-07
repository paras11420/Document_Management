using Backend.Data;
using Backend.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- Simple Connection String DEBUG ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
Console.WriteLine($"[DEBUG] Connection string: '{connectionString}'");
Console.WriteLine($"[DEBUG] Length: {connectionString?.Length ?? 0}");

// Check direct environment variable
var envVar = Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");
Console.WriteLine($"[DEBUG] Direct env var: '{envVar}'");

if (string.IsNullOrWhiteSpace(connectionString))
{
    Console.WriteLine("[ERROR] Connection string is NULL or EMPTY!");
}

// --- Database Configuration ---
builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (!string.IsNullOrEmpty(connectionString) &&
        (connectionString.Contains("postgresql") || connectionString.Contains("postgres")))
    {
        Console.WriteLine("[INFO] Using PostgreSQL");
        options.UseNpgsql(connectionString);
    }
    else if (!string.IsNullOrEmpty(connectionString) && connectionString.Contains("Server="))
    {
        Console.WriteLine("[INFO] Using SQL Server");
        options.UseSqlServer(connectionString);
    }
    else
    {
        throw new Exception("No valid connection string found");
    }
});

builder.Services.AddScoped<IDocumentService, DocumentService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["JWT:Issuer"],
            ValidAudience = builder.Configuration["JWT:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"] ?? "default-secret-key"))
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    timestamp = DateTime.UtcNow,
    environment = app.Environment.EnvironmentName
}));

var port = Environment.GetEnvironmentVariable("PORT") ?? "10000";
app.Urls.Add($"http://0.0.0.0:{port}");

// Simple migration without complex error handling
using (var scope = app.Services.CreateScope())
{
    try
    {
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        context.Database.Migrate();
        Console.WriteLine("[INFO] Migration successful");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[ERROR] Migration failed: {ex.Message}");
    }
}

app.Run();
