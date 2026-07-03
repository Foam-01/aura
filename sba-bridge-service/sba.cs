using System;
using System.Data.Odbc;
using System.Text;

class Program {
    static void Main(string[] args) {
        // 🎯 จุดสำคัญ: บังคับให้โปรแกรม C# ส่งข้อความออกจาก Console เป็น UTF-8 เพียว ๆ
        Console.OutputEncoding = Encoding.UTF8;

        if (args.Length == 0) { 
            Console.WriteLine("[]"); 
            return; 
        }
        string key = args[0];
        try {
            using (OdbcConnection conn = new OdbcConnection("DSN=SBA;Uid=airaftp;Pwd=airaftp@aira;")) {
                conn.Open();
                OdbcCommand cmd = conn.CreateCommand();
                
                // 🟢 ใช้คิวรีภาษาไทยแท้ตรงล็อกของโฟม 100%
                cmd.CommandText = "SELECT userid, usertname, usertsurname, position, divcode, deptcode, adminflag, status FROM refdb@testsmonline:tuser WHERE userid = '" + key + "'";
                
                using (OdbcDataReader reader = cmd.ExecuteReader()) {
                    if (reader.Read()) {
                        string uid = reader.GetValue(0).ToString().Trim();
                        string utname = reader.GetValue(1).ToString().Trim();       // ชื่อไทยตรง ๆ
                        string utsurname = reader.GetValue(2).ToString().Trim();    // นามสกุลไทยตรง ๆ
                        string pos = reader.GetValue(3).ToString().Trim();
                        string div = reader.GetValue(4).ToString().Trim();
                        string dept = reader.GetValue(5).ToString().Trim();
                        string aflag = reader.GetValue(6).ToString().Trim();
                        string stat = reader.GetValue(7).ToString().Trim();

                        string finalStatus = (stat == "A" || stat == "ACTIVE") ? "ACTIVE" : "INACTIVE";

                        Console.WriteLine("[{" +
                            "\"userid\":\"" + uid + "\"," +
                            "\"usertname\":\"" + utname + "\"," +
                            "\"usertsurname\":\"" + utsurname + "\"," +
                            "\"position\":\"" + pos + "\"," +
                            "\"divcode\":\"" + div + "\"," +
                            "\"deptcode\":\"" + dept + "\"," +
                            "\"adminflag\":\"" + aflag + "\"," +
                            "\"status\":\"" + finalStatus + "\"" +
                        "}]");
                    } else { 
                        Console.WriteLine("[]"); 
                    }
                }
            }
        } catch (Exception ex) {
            Console.WriteLine("[]");
        }
    }
}