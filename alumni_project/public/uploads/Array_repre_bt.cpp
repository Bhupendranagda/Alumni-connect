#include <iostream>
using namespace std;

char tree[10];

void set_root(char val)
{
    if (tree[1] == '\0')
    {
        tree[1] = val;
    }
    else
    {
        cout << "\n Already root is present \n";
    }
}

void set_left(char val, int parent)
{
    if (tree[parent] == '\0')
    {
        cout << "\n cant set anything at this " << (parent * 2) << " no parent found\n";
    }
    else
    {
        tree[2 * parent] = val;
    }
}

void set_right(char val, int parent)
{
    if (tree[parent] == '\0')
    {
        cout << "\n cant set anything at this " << (parent * 2) + 1 << " no parent found\n";
    }
    else
    {
        tree[(2 * parent) + 1] = val;
    }
}

void print()
{
    for (int i = 1; i <= 10; i++)
    {
        if(tree[i]!='\0') cout<<tree[i];
        else{
            cout<<"-";
        }
    }
}

int main()
{
    set_root('A');
    set_left('b', 1);
    set_right('c', 1);
    set_left('d', 2);
    set_right('e', 2);
    set_left('f', 3);
    set_right('g', 3);
    print();
    return 0;
}