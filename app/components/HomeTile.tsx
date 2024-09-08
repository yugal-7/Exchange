'use client'
export const Tile = ({props}:any) => {
    const data = props.data;
    return <div className="w-[394px] h-[242px] bg-zinc-900 mr-4 p-4">
        <h1 className="text-xl">{props.title}</h1>
       {
        data.map((d: any) => { 
             return <div className="flex flex-row justify-between">
             <span>{d.name}</span>
             <span>{d.price}</span>
             <span>{d.per}</span>
         </div>
       })
      }
       
    </div>
}