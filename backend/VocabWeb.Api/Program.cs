using System.Text;
using VocabWeb.Api.Services.ActivityEngine;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using VocabWeb.Api.Data;
using VocabWeb.Api.Models;
using VocabWeb.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Database Context
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Server=.\\SQLEXPRESS;Database=IeltsThanhLeVocabDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

// 2. Identity Configuration
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 8;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// 3. JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = builder.Configuration["JWT_KEY"] ?? jwtSettings["Key"]
    ?? "IeltsThanhLeLearning_SecretKey_For_Jwt_Token_Validation_2026_Minimum256Bits!";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "IeltsThanhLeVocabWeb",
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"] ?? "IeltsThanhLeVocabWeb",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 4. Application Services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IGoogleAuthService, GoogleAuthService>();
builder.Services.AddScoped<IExcelImportService, ExcelImportService>();
builder.Services.AddHttpClient();
builder.Services.AddScoped<IIpaService, IpaService>();
builder.Services.AddScoped<IQuestionEngineService, QuestionEngineService>();
builder.Services.AddScoped<IQuestionGenerationService, QuestionGenerationService>();
builder.Services.AddScoped<IAnswerEvaluationService, AnswerEvaluationService>();

// 5. CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5174",
            "http://127.0.0.1:3000"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

builder.Services.AddControllers();

var app = builder.Build();

// 6. Database Migration & Role Seeding
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.Migrate();

        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        string[] roles = { "Teacher", "TA", "Student", "Admin" };
        foreach (var role in roles)
        {
            if (!roleManager.RoleExistsAsync(role).GetAwaiter().GetResult())
            {
                roleManager.CreateAsync(new IdentityRole(role)).GetAwaiter().GetResult();
            }
        }

        // Seed default Admin account
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var adminEmail = builder.Configuration["ADMIN_EMAIL"] ?? "admin@ieltsthanle.vn";
        var adminPassword = builder.Configuration["ADMIN_PASSWORD"] ?? "Admin@2026!";
        var adminUser = userManager.FindByEmailAsync(adminEmail).GetAwaiter().GetResult();
        if (adminUser == null)
        {
            adminUser = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = "System Admin",
                IsActive = true,
                EmailConfirmed = true
            };
            userManager.CreateAsync(adminUser, adminPassword).GetAwaiter().GetResult();
            userManager.AddToRoleAsync(adminUser, "Admin").GetAwaiter().GetResult();
            logger.LogInformation("Default admin account created: {Email}", adminEmail);
        }

        // Seed default IELTS Feedback Templates if none exist
        var context2 = services.GetRequiredService<VocabWeb.Api.Data.AppDbContext>();
        if (!context2.FeedbackTemplates.Any())
        {
            var writingTemplate = new VocabWeb.Api.Models.FeedbackTemplate
            {
                Name = "IELTS Writing Rubric",
                Skill = VocabWeb.Api.Models.IeltsSkill.WRITING,
                Description = "Tiêu chí đánh giá IELTS Writing chuẩn",
                IsActive = true,
                Criteria = new List<VocabWeb.Api.Models.FeedbackTemplateCriterion>
                {
                    new() { Name = "Task Achievement / Task Response", SortOrder = 1 },
                    new() { Name = "Coherence & Cohesion", SortOrder = 2 },
                    new() { Name = "Lexical Resource", SortOrder = 3 },
                    new() { Name = "Grammatical Range & Accuracy", SortOrder = 4 }
                }
            };
            var speakingTemplate = new VocabWeb.Api.Models.FeedbackTemplate
            {
                Name = "IELTS Speaking Rubric",
                Skill = VocabWeb.Api.Models.IeltsSkill.SPEAKING,
                Description = "Tiêu chí đánh giá IELTS Speaking chuẩn",
                IsActive = true,
                Criteria = new List<VocabWeb.Api.Models.FeedbackTemplateCriterion>
                {
                    new() { Name = "Fluency & Coherence", SortOrder = 1 },
                    new() { Name = "Lexical Resource", SortOrder = 2 },
                    new() { Name = "Grammatical Range & Accuracy", SortOrder = 3 },
                    new() { Name = "Pronunciation", SortOrder = 4 }
                }
            };
            var readingTemplate = new VocabWeb.Api.Models.FeedbackTemplate
            {
                Name = "IELTS Reading Progress",
                Skill = VocabWeb.Api.Models.IeltsSkill.READING,
                Description = "Đánh giá tiến độ và kỹ năng Reading",
                IsActive = true,
                Criteria = new List<VocabWeb.Api.Models.FeedbackTemplateCriterion>
                {
                    new() { Name = "Tốc độ đọc và quản lý thời gian", SortOrder = 1 },
                    new() { Name = "Độ chính xác đáp án", SortOrder = 2 },
                    new() { Name = "Kỹ năng skimming/scanning", SortOrder = 3 },
                    new() { Name = "Nỗ lực và thái độ học tập", SortOrder = 4 }
                }
            };
            var listeningTemplate = new VocabWeb.Api.Models.FeedbackTemplate
            {
                Name = "IELTS Listening Progress",
                Skill = VocabWeb.Api.Models.IeltsSkill.LISTENING,
                Description = "Đánh giá tiến độ và kỹ năng Listening",
                IsActive = true,
                Criteria = new List<VocabWeb.Api.Models.FeedbackTemplateCriterion>
                {
                    new() { Name = "Độ chính xác đáp án", SortOrder = 1 },
                    new() { Name = "Kỹ năng nghe chi tiết", SortOrder = 2 },
                    new() { Name = "Kỹ năng nghe tổng quát", SortOrder = 3 },
                    new() { Name = "Nỗ lực và thái độ học tập", SortOrder = 4 }
                }
            };
            context2.FeedbackTemplates.AddRange(writingTemplate, speakingTemplate, readingTemplate, listeningTemplate);
            context2.SaveChanges();
            logger.LogInformation("Default IELTS feedback templates seeded.");
        }

        logger.LogInformation("Database migrated and roles seeded successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred during database migration or role seeding.");
    }
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
