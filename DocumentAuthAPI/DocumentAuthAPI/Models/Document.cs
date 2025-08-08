using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Models
{
    public class Document
    {
        public int Id { get; set; }  // Primary key for the Document

        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string FileName { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string FilePath { get; set; } = string.Empty;

        [Required]
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        // Foreign key reference to Department table
        [Required]
        public int DepartmentId { get; set; }

        // Navigation property to the related Department
        [Required]
        public Department Department { get; set; } = null!;
    }
}
