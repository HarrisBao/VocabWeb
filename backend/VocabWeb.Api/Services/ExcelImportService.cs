using System.Globalization;
using System.Text;
using ClosedXML.Excel;
using CsvHelper;
using CsvHelper.Configuration;
using VocabWeb.Api.DTOs;

namespace VocabWeb.Api.Services;

public class ExcelImportService : IExcelImportService
{
    private readonly ILogger<ExcelImportService> _logger;

    public ExcelImportService(ILogger<ExcelImportService> logger)
    {
        _logger = logger;
    }

    public async Task<ImportResultDto> ImportVocabularyFileAsync(Stream fileStream, string fileName)
    {
        var ext = Path.GetExtension(fileName).ToLowerInvariant();
        if (ext == ".xlsx")
        {
            return ImportExcel(fileStream);
        }
        else if (ext == ".csv")
        {
            return await ImportCsvAsync(fileStream);
        }

        return new ImportResultDto
        {
            Warnings = new List<string> { "Định dạng file không được hỗ trợ. Vui lòng tải lên file .xlsx hoặc .csv." }
        };
    }

    private ImportResultDto ImportExcel(Stream fileStream)
    {
        var result = new ImportResultDto();
        try
        {
            using var workbook = new XLWorkbook(fileStream);
            var worksheet = workbook.Worksheets.FirstOrDefault();
            if (worksheet == null)
            {
                result.Warnings.Add("File Excel không có dữ liệu trang tính.");
                return result;
            }

            var rows = worksheet.RowsUsed().ToList();
            if (rows.Count < 2)
            {
                result.Warnings.Add("File Excel phải chứa ít nhất 1 dòng tiêu đề và 1 dòng dữ liệu.");
                return result;
            }

            // Find headers
            var headerRow = rows[0];
            int wordCol = -1, meaningCol = -1, ipaCol = -1, exampleCol = -1;

            for (int col = 1; col <= headerRow.LastCellUsed().Address.ColumnNumber; col++)
            {
                var val = headerRow.Cell(col).GetString().Trim().ToLowerInvariant();
                if (val.Contains("word") || val.Contains("từ") || val.Contains("tu"))
                    wordCol = col;
                else if (val.Contains("meaning") || val.Contains("nghĩa") || val.Contains("nghia") || val.Contains("dịch"))
                    meaningCol = col;
                else if (val.Contains("ipa") || val.Contains("phiên âm") || val.Contains("phien am") || val.Contains("pronunciation"))
                    ipaCol = col;
                else if (val.Contains("example") || val.Contains("ví dụ") || val.Contains("vi du") || val.Contains("câu"))
                    exampleCol = col;
            }

            // Fallback to column index if headers are not named
            if (wordCol == -1) wordCol = 1;
            if (meaningCol == -1) meaningCol = 2;
            if (ipaCol == -1 && headerRow.LastCellUsed().Address.ColumnNumber >= 3) ipaCol = 3;

            int order = 0;
            for (int i = 1; i < rows.Count; i++)
            {
                var row = rows[i];
                result.TotalRead++;

                var word = row.Cell(wordCol).GetString().Trim();
                var meaning = row.Cell(meaningCol).GetString().Trim();
                var ipa = ipaCol != -1 ? row.Cell(ipaCol).GetString().Trim() : null;
                var example = exampleCol != -1 ? row.Cell(exampleCol).GetString().Trim() : null;

                if (string.IsNullOrWhiteSpace(word) || string.IsNullOrWhiteSpace(meaning))
                {
                    result.SkippedCount++;
                    continue;
                }

                result.Items.Add(new VocabularyItemDto
                {
                    Word = word,
                    Meaning = meaning,
                    IPA = !string.IsNullOrWhiteSpace(ipa) ? ipa : null,
                    Example = !string.IsNullOrWhiteSpace(example) ? example : null,
                    OrderIndex = order++
                });
                result.ValidCount++;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to read Excel file");
            result.Warnings.Add("Không thể đọc cấu trúc file Excel: " + ex.Message);
        }

        return result;
    }

    private async Task<ImportResultDto> ImportCsvAsync(Stream fileStream)
    {
        var result = new ImportResultDto();
        try
        {
            using var reader = new StreamReader(fileStream, Encoding.UTF8);
            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                HasHeaderRecord = true,
                MissingFieldFound = null,
                BadDataFound = null,
                TrimOptions = TrimOptions.Trim
            };

            using var csv = new CsvReader(reader, config);
            await csv.ReadAsync();
            csv.ReadHeader();
            var headers = csv.HeaderRecord?.Select(h => h.Trim().ToLowerInvariant()).ToList() ?? new List<string>();

            int wordIdx = headers.FindIndex(h => h.Contains("word") || h.Contains("từ") || h.Contains("tu"));
            int meaningIdx = headers.FindIndex(h => h.Contains("meaning") || h.Contains("nghĩa") || h.Contains("nghia"));
            int ipaIdx = headers.FindIndex(h => h.Contains("ipa") || h.Contains("phiên âm") || h.Contains("phien am"));
            int exampleIdx = headers.FindIndex(h => h.Contains("example") || h.Contains("ví dụ") || h.Contains("vi du"));

            if (wordIdx == -1) wordIdx = 0;
            if (meaningIdx == -1) meaningIdx = 1;
            if (ipaIdx == -1 && headers.Count >= 3) ipaIdx = 2;

            int order = 0;
            while (await csv.ReadAsync())
            {
                result.TotalRead++;

                var word = csv.GetField(wordIdx)?.Trim() ?? string.Empty;
                var meaning = (meaningIdx < csv.ColumnCount) ? csv.GetField(meaningIdx)?.Trim() ?? string.Empty : string.Empty;
                var ipa = (ipaIdx != -1 && ipaIdx < csv.ColumnCount) ? csv.GetField(ipaIdx)?.Trim() : null;
                var example = (exampleIdx != -1 && exampleIdx < csv.ColumnCount) ? csv.GetField(exampleIdx)?.Trim() : null;

                if (string.IsNullOrWhiteSpace(word) || string.IsNullOrWhiteSpace(meaning))
                {
                    result.SkippedCount++;
                    continue;
                }

                result.Items.Add(new VocabularyItemDto
                {
                    Word = word,
                    Meaning = meaning,
                    IPA = !string.IsNullOrWhiteSpace(ipa) ? ipa : null,
                    Example = !string.IsNullOrWhiteSpace(example) ? example : null,
                    OrderIndex = order++
                });
                result.ValidCount++;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to read CSV file");
            result.Warnings.Add("Không thể đọc cấu trúc file CSV: " + ex.Message);
        }

        return result;
    }
}
