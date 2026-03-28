using System;
using System.Security.Cryptography;
using System.Text;

namespace Backend
{
    public static class HashHelper
    {
        public static void GenerateHash()
        {
            var password = "admin123";
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            var hash = BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();
            Console.WriteLine(hash);
        }
    }
}
