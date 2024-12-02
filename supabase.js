// supabase.js

// 引入 Supabase 客户端库
const { createClient } = window.supabase;

// 初始化 Supabase 客户端
const supabaseUrl = 'https://your-supabase-url.supabase.co';  // 替换为你的 Supabase 项目的 URL
const supabaseKey = 'your-supabase-api-key';  // 替换为你的 Supabase 项目的 API 密钥
const supabase = createClient(supabaseUrl, supabaseKey);

// 示例：查询数据
async function getData() {
  let { data, error } = await supabase
    .from('your_table_name')  // 替换为你的数据库表名
    .select('*');

  if (error) {
    console.error(error);
  } else {
    console.log(data);
  }
}

// 执行查询
getData();
