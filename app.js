// 初始化Supabase客户端
const supabaseUrl = 'https://bynsmkkammeozaljubtu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5bnNta2thbW1lb3phbGp1YnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxOTA3OTksImV4cCI6MjA3MTc2Njc5OX0.dmbAS57dji2TB0oaRc93uddSv6wky5ez8j3RKGxTKCA';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 立即获取一次数据
    fetchData();
    
    // 设置每10秒自动刷新一次数据
    setInterval(fetchData, 10000);
});

// 获取数据函数
async function fetchData() {
    try {
        // 从Supabase获取数据，按创建时间降序排列
        let { data: sensor_data, error } = await supabase
            .from('sensor_data')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('获取数据出错:', error);
            return;
        }
        
        // 更新最后更新时间
        document.getElementById('lastUpdateTime').textContent = new Date().toLocaleTimeString();
        
        // 显示数据
        displayData(sensor_data);
    } catch (err) {
        console.error('发生错误:', err);
    }
}

// 显示数据函数
function displayData(data) {
    const container = document.getElementById('dataDisplay');
    
    // 如果没有数据
    if (!data || data.length === 0) {
        container.innerHTML = '<div class="no-data">暂无数据</div>';
        return;
    }
    
    // 生成数据卡片HTML
    container.innerHTML = data.map(item => `
        <div class="data-card">
            <h2>设备: ${item.sensor_id || '未知设备'}</h2>
            <div class="data-item">
                <span class="label">温度:</span>
                <span class="value">${item.temperature !== null ? item.temperature + ' °C' : '--'}</span>
            </div>
            <div class="data-item">
                <span class="label">湿度:</span>
                <span class="value">${item.humidity !== null ? item.humidity + ' %' : '--'}</span>
            </div>
            <div class="data-item">
                <span class="label">RTU值:</span>
                <span class="value">${item.RTU !== null ? item.RTU : '--'}</span>
            </div>
            <div class="data-item">
                <span class="label">状态:</span>
                <span class="value ${item.is_online ? 'status-online' : 'status-offline'}">
                    ${item.is_online ? '在线' : '离线'}
                </span>
            </div>
            <div class="data-item">
                <span class="label">上报时间:</span>
                <span class="value">${new Date(item.created_at).toLocaleString()}</span>
            </div>
        </div>
    `).join('');
}