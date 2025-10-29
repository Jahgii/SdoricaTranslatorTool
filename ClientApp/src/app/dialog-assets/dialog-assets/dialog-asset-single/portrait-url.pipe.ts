import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'portraitUrl'
})
export class PortraitUrlPipe implements PipeTransform {

  transform(iconName: string, imgs: { [name: string]: string }): string {
    return imgs[iconName + '.png'];
  }

}
