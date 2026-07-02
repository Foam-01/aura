using System;
using System.Data.Odbc;
using System.Text;

class Program
{
    static void Main(string[] args)
    {
        // บังคับให้ Console ส่งออกเป็น UTF-8 เผื่อกรณีดึงฟิลด์ภาษาไทยในอนาคต
        Console.OutputEncoding = Encoding.UTF8;

        if (args.Length == 0)
        {
            Console.WriteLine("[]");
            return;
        }
        string key = args[0];
        try
        {
            // ใช้ท่อเชื่อมต่อตรงเข้า DSN หลักของระบบ
            using (OdbcConnection conn = new OdbcConnection("DSN=SBA;Uid=airaftp;Pwd=airaftp@aira;"))
            {
                conn.Open();
                OdbcCommand cmd = conn.CreateCommand();

                // คิวรีดึงข้อมูลพนักงานจากรหัสที่ส่งเข้ามา
                cmd.CommandText = "SELECT userid, userename, useresurname, position, divcode, deptcode, adminflag, status FROM tuser WHERE userid = '" + key + "'";

                using (OdbcDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        string rawStatus = reader["status"].ToString().Trim();
                        // 🎯 ปรับจุดตาย: ดักจับถ้าสถานะใน DB ของ SBA เป็น "A" ให้แปลงคำเป็น "ACTIVE" ให้เท่าเทียมกับระบบ 1-9 ทันที!
                        string finalStatus = (rawStatus == "A" || rawStatus == "ACTIVE") ? "ACTIVE" : "INACTIVE";

                        Console.WriteLine("[{" +
                            "\"userid\":\"" + reader["userid"].ToString().Trim() + "\"," +
                            "\"usertname\":\"" + reader["userename"].ToString().Trim() + "\"," +
                            "\"usertsurname\":\"" + reader["useresurname"].ToString().Trim() + "\"," +
                            "\"position\":\"" + reader["position"].ToString().Trim() + "\"," +
                            "\"divcode\":\"" + reader["divcode"].ToString().Trim() + "\"," +
                            "\"deptcode\":\"" + reader["deptcode"].ToString().Trim() + "\"," +
                            "\"adminflag\":\"" + reader["adminflag"].ToString().Trim() + "\"," +
                            "\"status\":\"" + finalStatus + "\"" +
                        "}]");
                    }
                    else
                    {
                        Console.WriteLine("[]");
                    }
                }
            }
        }
        catch (Exception ex)
        {
            // เกิดข้อผิดพลาดใด ๆ ส่งอาเรย์ว่างกลับไปหน้าบ้าน เพื่อไม่ให้แผงวงจรรวมล่ม
            Console.WriteLine("[]");
        }
    }
}