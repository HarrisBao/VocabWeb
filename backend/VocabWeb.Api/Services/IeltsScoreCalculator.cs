namespace VocabWeb.Api.Services;

public static class IeltsScoreCalculator
{
    public static (decimal RawAverage, decimal OverallBand)? CalculateOverall(decimal? listening, decimal? reading, decimal? writing, decimal? speaking)
    {
        if (listening == null || reading == null || writing == null || speaking == null) return null;
        
        decimal l = listening.Value;
        decimal r = reading.Value;
        decimal w = writing.Value;
        decimal s = speaking.Value;

        if (l < 0 || l > 9 || r < 0 || r > 9 || w < 0 || w > 9 || s < 0 || s > 9)
            throw new ArgumentException("IELTS bands must be between 0 and 9.");

        // Check if they are valid increments of 0.5 (optional but good)
        if (l % 0.5m != 0 || r % 0.5m != 0 || w % 0.5m != 0 || s % 0.5m != 0)
            throw new ArgumentException("IELTS bands must be in increments of 0.5.");

        decimal average = (l + r + w + s) / 4m;
        // Round to nearest 0.5 using MidpointRounding.AwayFromZero
        decimal overall = Math.Round(average * 2m, 0, MidpointRounding.AwayFromZero) / 2m;
        return (average, overall);
    }
}
