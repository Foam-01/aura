using System;
using System.Data.Odbc;
using System.Text;
using System.Collections.Generic; // 🟢 เพิ่มเข้ามาเพื่อใช้ List คุมอาเรย์

class Program {
    static void Main(string[] args) {
        Console.OutputEncoding = Encoding.UTF8;

        if (args.Length == 0) { 
            Console.WriteLine("[]"); 
            return; 
        }
        string key = args[0].ToLower().Trim();
        
        string numericKey = System.Text.RegularExpressions.Regex.Replace(key, @"\D", ""); 
        string staffKeyWithS = key.StartsWith("s") ? key : "s" + key;

        try {
            using (OdbcConnection conn = new OdbcConnection("DSN=SBA;Uid=airaftp;Pwd=airaftp@aira;")) {
                conn.Open();
                OdbcCommand cmd = conn.CreateCommand();
                
                cmd.CommandText = "SELECT userid, usertname, usertsurname, position, divcode, deptcode, adminflag, status " +
                                  "FROM refdb@testsmonline:tuser " +
                                  "WHERE userid = '" + key + "' " +
                                  "   OR userid = '" + staffKeyWithS + "' " +
                                  "   OR userid = '" + numericKey + "'";
                
                using (OdbcDataReader reader = cmd.ExecuteReader()) {
                    List<string> jsonRecords = new List<string>();

                    // 🎯 ปรับจุดตายจาก if เป็น while: วนลูปเก็บทุกบรรทัด (ถ้ามีทั้งร่างมี s และไม่มี s โผล่มาคู่ มันจะเก็บหมดโว้ยโฟม!)
                    while (reader.Read()) {
                        string stat = reader.GetValue(7).ToString().Trim();

                        // ถ้า status ไม่ใช่ "A" ให้ข้ามบรรทัดนี้ไป ไม่นำมาคำนวณโชว์
                        if (stat != "A") continue;

                        string uid = reader.GetValue(0).ToString().Trim();
                        string utname = reader.GetValue(1).ToString().Trim();
                        string utsurname = reader.GetValue(2).ToString().Trim();
                        string pos = reader.GetValue(3).ToString().Trim();
                        string div = reader.GetValue(4).ToString().Trim();
                        string dept = reader.GetValue(5).ToString().Trim();
                        string aflag = reader.GetValue(6).ToString().Trim();

                        string record = "{" +
                            "\"userid\":\"" + uid + "\"," +
                            "\"usertname\":\"" + utname + "\"," +
                            "\"usertsurname\":\"" + utsurname + "\"," +
                            "\"position\":\"" + pos + "\"," +
                            "\"divcode\":\"" + div + "\"," +
                            "\"deptcode\":\"" + dept + "\"," +
                            "\"adminflag\":\"" + aflag + "\"," +
                            "\"status\":\"ACTIVE\"" +
                        "}";
                        
                        jsonRecords.Add(record);
                    }

                    // มัดรวมเรคคอร์ดทั้งหมดที่เจอพ่นออกไปเป็นอาเรย์ JSON
                    if (jsonRecords.Count > 0) {
                        Console.WriteLine("[" + string.Join(",", jsonRecords) + "]");
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