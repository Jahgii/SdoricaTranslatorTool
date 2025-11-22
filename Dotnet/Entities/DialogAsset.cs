using System.Text.Json.Serialization;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MessagePack;

namespace SdoricaTranslatorTool.Entities;

[MessagePackObject]
public class DialogAsset
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    [Key("Id")]
    public string? Id { get; set; }
    [Key("OriginalFilename")]
    public required string OriginalFilename { get; set; }
    [Key("Filename")]
    public required string Filename { get; set; }
    [Key("MainGroup")]
    public required string MainGroup { get; set; }
    [Key("Group")]
    public required string Group { get; set; }
    [Key("Number")]
    public int Number { get; set; }
    [Key("Language")]
    public required string Language { get; set; }
    [Key("Translated")]
    public bool Translated { get; set; }
    [Key("Model")]
    public required DialogAssetModel Model { get; set; }
    [Key("ReferenceAavatarImage")]
    public required DialogAssetArray ReferenceAavatarImage { get; set; }
    [Key("ReferenceDialogAudio")]
    public required DialogAssetArray ReferenceDialogAudio { get; set; }
    [Key("_objectReferences")]
    public required DialogAssetArray _objectReferences { get; set; }
    [Key("_serializedStateKeys")]
    public required DialogAssetArray _serializedStateKeys { get; set; }
    [Key("_serializedStateValues")]
    public required DialogAssetArray _serializedStateValues { get; set; }
}

[MessagePackObject]
public class DialogAssetModel
{
    [BsonElement("$content")]
    [JsonPropertyName("$content")]
    [Key("$content")]
    public required List<Dialog> Content { get; set; }
}

[MessagePackObject]
public class DialogAssetArray
{
    [BsonElement("$content")]
    [JsonPropertyName("$content")]
    [Key("$content")]
    public required List<string> Content { get; set; }
}

[MessagePackObject]
public class Dialog
{
    [Key("ID")]
    public required string ID { get; set; }
    [Key("OriginalSpeakerName")]
    public required string OriginalSpeakerName { get; set; }
    [Key("SpeakerName")]
    public required string SpeakerName { get; set; }
    [Key("SpeakerAssetName")]
    public required string SpeakerAssetName { get; set; }
    [Key("OriginalIconName")]
    public required string OriginalIconName { get; set; }
    [Key("IconName")]
    public required string IconName { get; set; }
    [Key("IconLocate")]
    public int IconLocate { get; set; }
    [Key("OriginalText")]
    public required string OriginalText { get; set; }
    [Key("Text")]
    public required string Text { get; set; }
    [Key("sfxName")]
    public required string sfxName { get; set; }
    [Key("sfxVolume")]
    public double sfxVolume { get; set; }
}