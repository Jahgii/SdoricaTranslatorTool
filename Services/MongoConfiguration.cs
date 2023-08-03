using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;
using MongoDB.Driver;

namespace SdoricaTranslatorTool
{
    public static class MongoConfiguration
    {
        /// <summary>
        /// Configure and Add IMongoClient as Singleton(DI)
        /// </summary>
        /// <param name="services"> IServiceCollection </param>
        /// <param name="config"> IConfiguration </param>
        public static void ConfigureMongoDB(this IServiceCollection services, IConfiguration config)
        {
            services.AddSingleton<IMongoClient>(s =>
            {
                var connectionString = config["Mongoconnection:connectionServer"];
                var settings = MongoClientSettings.FromConnectionString(connectionString);
                settings.ServerApi = new ServerApi(ServerApiVersion.V1);

                BsonSerializer.RegisterSerializer(typeof(decimal), new DecimalSerializer(BsonType.Decimal128));
                BsonSerializer.RegisterSerializer(typeof(decimal?), new NullableSerializer<decimal>(new DecimalSerializer(BsonType.Decimal128)));

                return new MongoClient(settings);
            });

            services.AddSingleton<ICustomMongoClient, CustomMongoClient>();

        }
    }
} 