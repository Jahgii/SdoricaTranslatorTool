using MongoDB.Driver;
using System.Linq.Expressions;

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

        public async Task Update<T>(IClientSessionHandle session, Expression<Func<T, bool>> filter, UpdateDefinition<T> collectionData)
        {
            await GetCollection<T>().FindOneAndUpdateAsync<T>(session, filter, collectionData);
        }

        public async Task Replace<T>(IClientSessionHandle session, Expression<Func<T, bool>> predicate, T collectionData)
        {
            await GetCollection<T>().ReplaceOneAsync(session, predicate, collectionData);
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
        public Task Update<T>(IClientSessionHandle session, Expression<Func<T, bool>> filter, UpdateDefinition<T> collectionData);
        public Task Replace<T>(IClientSessionHandle session, Expression<Func<T, bool>> predicate, T collectionData);
        public Task<IClientSessionHandle> StartSessionAsync();
        public IMongoCollection<T> GetCollection<T>();

    }
}