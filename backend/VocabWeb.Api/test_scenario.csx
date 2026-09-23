#r "nuget: Microsoft.Data.SqlClient, 5.1.5"
using System;
using Microsoft.Data.SqlClient;

string connStr = "Server=.\\SQLEXPRESS;Database=IeltsThanhLeVocabDb;Trusted_Connection=True;TrustServerCertificate=True";

using (var conn = new SqlConnection(connStr))
{
    conn.Open();
    Console.WriteLine("Connected!");
    
    var cmd = conn.CreateCommand();
    cmd.CommandText = "SELECT TOP 1 Id, Email FROM AspNetUsers WHERE UserName = 'admin@ieltsthanle.vn'";
    using (var reader = cmd.ExecuteReader())
    {
        while(reader.Read())
        {
            Console.WriteLine($"Admin: {reader.GetString(1)}");
        }
    }
}
