using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using Moq.Protected;
using VocabWeb.Api.Models;
using VocabWeb.Api.Services;
using Xunit;

namespace VocabWeb.Tests
{
    public class IpaServiceTests
    {
        private Mock<HttpMessageHandler> _msgHandlerMock;
        private IpaService _service;

        public IpaServiceTests()
        {
            _msgHandlerMock = new Mock<HttpMessageHandler>();
            var httpClientFactoryMock = new Mock<IHttpClientFactory>();
            httpClientFactoryMock.Setup(f => f.CreateClient(It.IsAny<string>()))
                .Returns(() => new HttpClient(_msgHandlerMock.Object));
            var loggerMock = new Mock<ILogger<IpaService>>();
            _service = new IpaService(httpClientFactoryMock.Object, loggerMock.Object);
        }

        [Fact]
        public async Task GenerateIpaForWordAsync_PrimarySuccess_NoFallbackNeeded()
        {
            var suvankarJson = "{\"word\":\"hello\",\"ipa\":\"/həˈloʊ/\"}";
            _msgHandlerMock.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(suvankarJson, Encoding.UTF8, "application/json")
                });

            var result = await _service.GenerateIpaForWordAsync("hello");

            Assert.Equal("/həˈloʊ/", result);
        }

        [Fact]
        public async Task GenerateIpaForWordAsync_PrimaryFail_FallbackSuccess()
        {
            var fallbackJson = "[{\"word\":\"hello\",\"phonetic\":\"/fallback/\"}]";
            _msgHandlerMock.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync((HttpRequestMessage req, CancellationToken _) =>
                {
                    Console.WriteLine("URL: " + req.RequestUri.ToString());
                    if (req.RequestUri.ToString().Contains("suvankar"))
                    {
                        return new HttpResponseMessage { StatusCode = HttpStatusCode.InternalServerError };
                    }
                    if (req.RequestUri.ToString().Contains("dictionaryapi.dev"))
                    {
                        return new HttpResponseMessage
                        {
                            StatusCode = HttpStatusCode.OK,
                            Content = new StringContent(fallbackJson, Encoding.UTF8, "application/json")
                        };
                    }
                    return new HttpResponseMessage { StatusCode = HttpStatusCode.InternalServerError };
                });

            var result = await _service.GenerateIpaForWordAsync("hello");
            Console.WriteLine("RESULT: " + (result ?? "NULL"));
            Assert.Equal("/fallback/", result);
        }

        [Fact]
        public async Task GenerateIpaForWordAsync_BothFail_ReturnsNull()
        {
            _msgHandlerMock.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.InternalServerError
                });

            var result = await _service.GenerateIpaForWordAsync("hello");

            Assert.Null(result);
        }

        [Fact]
        public async Task GenerateIpaForWordAsync_LegacyFakeIpa_IsTreatedAsMissing()
        {
            var items = new List<VocabularyItem>
            {
                new VocabularyItem { Id = 1, Word = "domesticate", IPA = "/domesticate/" },
                new VocabularyItem { Id = 2, Word = "hello", IPA = "/hello/" }
            };

            _msgHandlerMock.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync((HttpRequestMessage req, CancellationToken _) =>
                {
                    var word = req.RequestUri.ToString().Contains("domesticate") ? "domesticate" : "hello";
                    var suvankarJson = $"{{\"word\":\"{word}\",\"ipa\":\"/newipa/\"}}";
                    return new HttpResponseMessage
                    {
                        StatusCode = HttpStatusCode.OK,
                        Content = new StringContent(suvankarJson, Encoding.UTF8, "application/json")
                    };
                });

            var result = await _service.GenerateMissingIpaAsync(items);
            Console.WriteLine($"TotalMissingFound: {result.TotalMissingFound}, GeneratedCount: {result.GeneratedCount}");
            Assert.Equal(2, result.TotalMissingFound);
            Assert.Equal(2, result.GeneratedCount);
            Assert.Equal("/newipa/", items[0].IPA);
            Assert.Equal("/newipa/", items[1].IPA);
        }

        [Fact]
        public async Task GenerateIpaForWordAsync_ExistingValidIpa_IsPreserved()
        {
            var items = new List<VocabularyItem>
            {
                new VocabularyItem { Id = 1, Word = "domesticate", IPA = "/dəˈmestɪkeɪt/" }
            };

            var result = await _service.GenerateMissingIpaAsync(items);

            Assert.Equal(0, result.TotalMissingFound);
            Assert.Equal(0, result.GeneratedCount);
            Assert.Equal("/dəˈmestɪkeɪt/", items[0].IPA);
        }
    }
}
