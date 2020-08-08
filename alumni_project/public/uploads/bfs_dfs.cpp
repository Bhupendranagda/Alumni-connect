#include <iostream>
#include <vector>
#include <stack>
#include <queue>
using namespace std;
typedef pair<int,int> pii;
typedef vector<vector<pii>> vvpii;

void psutil(stack<pii> open) {
    if(open.empty()) return;
    pair<int,int> cn = open.top();
    open.pop();
    psutil(open);
    cout<<cn.first<<" ";
    open.push(cn);
}
void printstack(stack<pii> open) { 
    if(open.empty()) cout<<"empty";
    else psutil(open);
}

void printqueue(queue<pii> open) {
    if(open.empty()) { cout<<"empty"; return;}
    for(auto t = open; !t.empty(); t.pop()) cout<<t.front().first<<" ";
}

void printclosed(vector<pii> c) {
    if(c.empty()) {cout<<"empty"; return;}
    for(auto i : c) cout<<i.first<<" ";
}

void inline print_bfs_lists(queue<pii>open, vector<pii>closed) { 
    cout<<"___________________________"<<endl;
    cout<<"open list   : ";printqueue(open);cout<<endl; 
    cout<<"closed list : ";printclosed(closed);cout<<endl;
}

void inline print_dfs_list(stack<pii> open, vector<pii>closed) {
    cout<<"___________________________"<<endl;
    cout<<"open list   : ";printstack(open);cout<<endl; 
    cout<<"closed list : ";printclosed(closed);cout<<endl;
}

void bfs(const vvpii& graph, int start, int end) {
    cout<<"BFS search :"<<endl;
    queue<pii> open; vector<pii> closed;
    vector<bool> visited(graph.size(), false);
    open.push({start, 0});
    pii currnode = open.front();
    while(currnode.first!=end && !open.empty()) {
        print_bfs_lists(open,closed);
        currnode = open.front(); 
        open.pop(); 
        closed.push_back(currnode); 
        for(auto i : graph[currnode.first]) {
            if(!visited[i.first]) {
                open.push(i);
                visited[i.first] = true;

            } 
        }
    }
    print_bfs_lists(open, closed);
}

void dfs(const vvpii& graph, int start, int end) {
    cout<<"DFS search : "<<endl;
    stack<pii> open; vector<pii> closed;
    bool visited[graph.size()] = {0};
    open.push({start, 0});
    for(pii currnode = open.top();currnode.first!=end && !open.empty(); ) {
        print_dfs_list(open, closed);
        currnode = open.top();
        open.pop(); closed.push_back(currnode); 
        for(auto i : graph[currnode.first]) {
            if(visited[i.first]) continue; 
            open.push(i);
            visited[i.first] = 1;
        }
    }
    print_dfs_list(open,closed);
}
int main() {
    int n_of_nodes; cin>>n_of_nodes;
    vector<vector<pair<int, int>>> graph(n_of_nodes);
    for(int i = 0; i<n_of_nodes; i++) {
        int nad; cin>>nad;
        while(nad--){
            int adn, dist; cin>>adn>>dist;
            graph[i].push_back({adn, dist});
        }
    }
    int startnode, endnode; cin>>startnode>>endnode;
    bfs(graph, startnode, endnode); cout<<endl<<endl;
    dfs(graph, startnode, endnode);
    return 0;
}

// 5
// 2 1 1 2 4
// 3 2 2 3 5 4 12
// 1 3 2
// 1 4 3
// 0 
// 0 4