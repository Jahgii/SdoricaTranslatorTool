using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SdoricaTranslatorTool
{
    public class DialogAsset
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? DialogAssetId { get; set; }
        public string? OriginalFilename { get; set; }
        public string? Filename { get; set; }
        public string? MainGroup { get; set; }
        public string? Group { get; set; }
        public int Number { get; set; }
        public string? Language { get; set; }
        public DialogAssetModel? Model { get; set; }
        public DialogAssetArray? ReferenceAavatarImage { get; set; }
        public DialogAssetArray? ReferenceDialogAudio { get; set; }
        public DialogAssetArray? _objectReferences { get; set; }
        public DialogAssetArray? _serializedStateKeys { get; set; }
        public DialogAssetArray? _serializedStateValues { get; set; }
    }

    public class DialogAssetModel
    {
        [BsonElement("$content")]
        [JsonPropertyName("$content")]
        public List<Dialog>? Content { get; set; }
    }

    public class DialogAssetArray
    {
        [BsonElement("$content")]
        [JsonPropertyName("$content")]
        public List<string>? Content { get; set; }
    }

    public class Dialog
    {
        public string? Id { get; set; }
        public string? SpeakerName { get; set; }
        public string? SpeakerAssetName { get; set; }
        public string? IconName { get; set; }
        public int IconLocate { get; set; }
        public string? Text { get; set; }
        public string? SfxName { get; set; }
        public decimal SfxVolume { get; set; }

    }
}