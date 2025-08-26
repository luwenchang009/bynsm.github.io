// 初始化Supabase客户端
const supabaseUrl = 'https://bynsmkkammeozaljubtu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5bnNta2thbW1lb3phbGp1YnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxOTA3OTksImV4cCI6MjA3MTc2Njc5OX0.dmbAS57dji2TB0oaRc93uddSv6wky5ez8j3RKGxTKCA';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 获取指令历史
    fetchData();
    
    // 设置表单提交事件
    document.getElementById('commandForm').addEventListener('submit', handleCommandSubmit);
});

// 处理指令下发表单提交
async function handleCommandSubmit(event) {
    event.preventDefault();
    
    const deviceId = document.getElementById('deviceId').value;
    const command = document.getElementById('command').value;
    const messageDiv = document.getElementById('formMessage');
    
    try {
        // 发送指令到Supabase
        const { data, error } = await supabase
            .from('commands')
            .insert([
                { 
                    sensor_id: deviceId, 
                    zifu: command 
                }
            ])
            .select('*'); // 使用select('*')代替Prefer头

        if (error) {
            throw error;
        }

        // 显示成功消息
        messageDiv.textContent = `指令下发成功！ID: ${data[0].id}`;
        messageDiv.className = 'success';
        
        // 清空表单
        document.getElementById('command').value = '';
        
        // 刷新指令历史
        setTimeout(fetchData, 1000);
        
    } catch (error) {
        console.error('下发指令出错:', error);
        messageDiv.textContent = `错误: ${error.message}`;
        messageDiv.className = 'error';
    }
}

// 获取指令历史数据
async function fetchData() {
    try {
        // 从commands表获取所有数据，按时间倒序排列
        let { data: commands, error } = await supabase
            .from('commands')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }
        
        // 更新最后更新时间
        document.getElementById('lastUpdateTime').textContent = new Date().toLocaleTimeString();
        
        // 显示数据
        displayData(commands);
    } catch (error) {
        console.error('获取数据出错:', error);
        alert('获取数据失败: ' + error.message);
    }
}

// 显示指令历史数据
function displayData(data) {
    const container = document.getElementById('dataDisplay');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="no-data">暂无指令历史</div>';
        return;
    }
    
    // 生成指令卡片HTML
    container.innerHTML = data.map(item => `
        <div class="data-card">
            <h2>指令 #${item.id}</h2>
            <div class="data-item">
                <span class="label">设备ID:</span>
                <span class="value">${item.sensor_id || '未知设备'}</span>
            </div>
            <div class="data-item">
                <span class="label">指令内容:</span>
                <span class="value">${item.zifu || '--'}</span>
            </div>
            <div class="data-item">
                <span class="label">闸开度:</span>
                <span class="value">${item.zhakaidu !== null ? item.zhakaidu : '--'}</span>
            </div>
            <div class="data-item">
                <span class="label">油开度:</span>
                <span class="value">${item.yukaidu !== null ? item.yukaidu : '--'}</span>
            </div>
            <div class="data-item">
                <span class="label">上限状态:</span>
                <span class="value">${item.shangxian !== null ? (item.shangxian ? '是' : '否') : '--'}</span>
            </div>
            <div class="data-item">
                <span class="label">下发时间:</span>
                <span class="value">${new Date(item.created_at).toLocaleString()}</span>
            </div>
        </div>
    `).join('');
}
