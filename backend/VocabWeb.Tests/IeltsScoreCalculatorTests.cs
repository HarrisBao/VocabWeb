using VocabWeb.Api.Services;
using Xunit;

namespace VocabWeb.Tests;

public class IeltsScoreCalculatorTests
{
    [Theory]
    [InlineData(6.5, 6.5, 5.0, 7.0, 6.25, 6.5)]
    [InlineData(6.5, 6.5, 5.5, 6.0, 6.125, 6.0)]
    [InlineData(7.0, 7.5, 6.0, 6.5, 6.75, 7.0)]
    [InlineData(4.0, 3.5, 4.0, 4.0, 3.875, 4.0)]
    [InlineData(7.0, 7.0, 7.0, 7.0, 7.0, 7.0)]
    [InlineData(8.5, 8.5, 8.5, 8.5, 8.5, 8.5)]
    public void CalculateOverall_ReturnsCorrectBands(decimal l, decimal r, decimal w, decimal s, decimal expectedRaw, decimal expectedOverall)
    {
        var result = IeltsScoreCalculator.CalculateOverall(l, r, w, s);
        
        Assert.NotNull(result);
        Assert.Equal(expectedRaw, result.Value.RawAverage);
        Assert.Equal(expectedOverall, result.Value.OverallBand);
    }

    [Fact]
    public void CalculateOverall_MissingSkill_ReturnsNull()
    {
        var result = IeltsScoreCalculator.CalculateOverall(6.5m, 6.5m, null, 7.0m);
        Assert.Null(result);
    }

    [Fact]
    public void CalculateOverall_InvalidSkillRange_ThrowsException()
    {
        Assert.Throws<ArgumentException>(() => IeltsScoreCalculator.CalculateOverall(-1m, 6.5m, 6.0m, 6.5m));
        Assert.Throws<ArgumentException>(() => IeltsScoreCalculator.CalculateOverall(10m, 6.5m, 6.0m, 6.5m));
    }
}
