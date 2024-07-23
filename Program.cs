using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Diagnostics;
using SdoricaTranslatorTool;

var cors = "CustomCors";
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    });

//JWT
// builder.Services.ConfigureJwt(builder.Configuration);

builder.Services.AddExceptionHandler<MainExceptionHandler>();
builder.Services.AddProblemDetails();

// CORS
builder.Services
    .AddCors(options =>
    {
        options.AddPolicy(cors, builder =>
            {
                builder.AllowAnyOrigin()
                .AllowAnyHeader()
                .AllowAnyMethod();
            });
    });

// Add MongoClient as Singleton
builder.Services.ConfigureMongoDB(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
// app.UseAuthentication();
// app.UseAuthorization();
app.UseCors(cors);

app.MapControllerRoute(
        name: "default",
        pattern: "{controller}/{action=Index}/{id?}"
    );
// .RequireAuthorization();

app.MapControllers();
// .RequireAuthorization();

app.MapFallbackToFile("index.html");

app.MapGet("/api/status", () =>
{
    var status = new
    {
        Version = "1.0.0",
        Status = "Alive"
    };

    return status;
})
.WithName("Status");

app.Run();
