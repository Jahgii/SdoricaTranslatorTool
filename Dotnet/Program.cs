using SdoricaTranslatorTool.Extensions;

var cors = "CustomCors";
var builder = WebApplication.CreateBuilder(args);

//Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add services to the container.
builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    });

// JWT
builder.Services.ConfigureJwt(builder.Configuration);

builder.Services.AddExceptionHandler<MainExceptionHandler>();
builder.Services.AddProblemDetails();

// CORS
builder.Services
    .AddCors(options =>
    {
        options.AddPolicy(cors, builder =>
            {
                builder
                    .AllowAnyOrigin()
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
    });

// Add MongoClient as Singleton
builder.Services.ConfigureMongoDB(builder.Configuration);

//Cache
builder.Services.AddMemoryCache();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}
else
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(cors);
app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseMiddleware<ApiKeyMiddleware>();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
        name: "default",
        pattern: "{controller}/{action=Index}/{id?}"
    ).RequireAuthorization();

app.MapControllers().RequireAuthorization();

app.Run();
