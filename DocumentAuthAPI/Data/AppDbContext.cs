using Backend.Models;
using Microsoft.EntityFrameworkCore;
using DocumentAuthAPI.Models;


namespace Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        { }

        public DbSet<Document> Documents { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<User> Users { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

                modelBuilder.Entity<Department>()
                .HasIndex(d => d.Name)
                .IsUnique(); // 🚨 This enforces uniqueness at DB level

            // Define the one-to-many relationship between Document and Department
            modelBuilder.Entity<Document>()
                .HasOne(d => d.Department)
                .WithMany(dept => dept.Documents)
                .HasForeignKey(d => d.DepartmentId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
