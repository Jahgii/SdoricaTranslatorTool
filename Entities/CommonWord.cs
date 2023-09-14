using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SdoricaTranslatorTool
{
    public class CommonWord
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public required string Original { get; set; }
        public required string Translation { get; set; }
    }
}