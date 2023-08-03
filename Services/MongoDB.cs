using MongoDB.Driver;

namespace SdoricaTranslatorTool
{
    public class CustomMongoClient : ICustomMongoClient
    {
        IMongoClient _mongoClient;
        IMongoDatabase _mongoDB;
        private IConfiguration _config;

        public CustomMongoClient(IMongoClient mongoClient, IConfiguration config)
        {
            _mongoClient = mongoClient;
            _config = config;
            _mongoDB = _mongoClient.GetDatabase(@_config["DBName"]);
        }

        public async Task Create<T>(IClientSessionHandle session, T collectionData)
        {
            await GetCollection<T>().InsertOneAsync(session, collectionData);
        }

        public async Task Create<T>(IClientSessionHandle session, IEnumerable<T> collectionData)
        {
            await GetCollection<T>().InsertManyAsync(session, collectionData);
        }

        public async Task<IClientSessionHandle> StartSessionAsync()
        {
            return await _mongoDB.Client.StartSessionAsync();
        }

        public IMongoCollection<T> GetCollection<T>()
        {
            return _mongoDB.GetCollection<T>(typeof(T).Name);
        }

    }

    public interface ICustomMongoClient
    {
        public Task Create<T>(IClientSessionHandle session, T collectionData);
        public Task Create<T>(IClientSessionHandle session, IEnumerable<T> collectionData);
        public Task<IClientSessionHandle> StartSessionAsync();
        public IMongoCollection<T> GetCollection<T>();

    }
}