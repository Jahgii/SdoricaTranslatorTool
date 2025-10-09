using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace SdoricaTranslatorTool
{
    public class Jwt(IConfiguration config) : IJwt
    {
        private IConfiguration _config = config;

        public string GenerateToken(double hours)
        {
            var sSK = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["IssuerSigningKey"] ?? ""));
            var sC = new SigningCredentials(sSK, SecurityAlgorithms.HmacSha256);
            var jwtST = new JwtSecurityToken(
                issuer: _config["Issuer"],
                audience: _config["Audience"],
                claims: [],
                expires: DateTime.Now.AddHours(hours),
                signingCredentials: sC
            );
            return new JwtSecurityTokenHandler().WriteToken(jwtST);
        }

    }

    public interface IJwt
    {
        public string GenerateToken(double hours);

    }
}