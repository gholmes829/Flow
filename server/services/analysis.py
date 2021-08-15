"""

"""

import sys
import json

def main():
    song_data_raw = input()   
    song_data = json.loads(song_data_raw) 
    
    #with open('test.txt', 'w') as f:
    #    f.write(song_data_raw)
        
    output = {'song_scores': []}
    for i, song in enumerate(song_data['songs']):
        output['song_scores'].append({
            'score': 2,
            'cluster': 3,
            'uri': song_data['songs'][i]['uri']
        })

    print(json.dumps(output), flush = True)

if __name__ == '__main__':
    main()