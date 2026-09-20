using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using VocabWeb.Api.Data;
using VocabWeb.Api.Models;

var options = new DbContextOptionsBuilder<AppDbContext>()
    .UseSqlServer("Server=localhost;Database=VocabWebDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True")
    .Options;
using var db = new AppDbContext(options);

var dm = db.Classes.FirstOrDefault(c => c.Code == "DM");
var dp = db.Classes.FirstOrDefault(c => c.Code == "DP");
if (dm == null || dp == null) {
    Console.WriteLine("DM or DP class not found.");
    return;
}
Console.WriteLine("Found DM (Id: {dm.Id}) and DP (Id: {dp.Id})");
