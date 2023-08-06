using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace SdoricaTranslatorTool.Entities
{
    public class LocalizationCategory
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public required string Name { get; set; }
        public int Keys { get; set; }
        public int KeysTranslated { get; set; }
    }

    public class LocalizationKey {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }
        public required string Category { get; set; }
        public required string Name { get; set; }
        public bool Translated { get; set; }
        public required Dictionary<string, string> Translations { get; set; }
    }
}
